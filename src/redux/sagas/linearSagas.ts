import { call, put, takeLatest } from "redux-saga/effects";
import {
  AuthActionTypes,
  FETCH_DATA_FROM_LINEAR,
  HANDLE_CALLBACK,
  LOGIN,
  LOGIN_REQUEST,
  loginSuccess,
  LOGOUT,
  RESET_FORM,
  setUserDetails,
  storeTasks,
  UPDATE_RESPONSE,
} from "../actions";
import { navigateTo } from "../navigate";
import axios from "axios";
import { setToastFailure, setToastSuccess } from "../reducers/toastReducer";
import { clearSpecificCookie, getCookie } from "../../utils";
//@ts-ignore
import { configs } from "../../../config";
import store from "../store";
import { loggingService } from "../../services/loggingService";

const API_BASE_URL = "https://tech-flow-backend.vercel.app/api";

export function* watchActionRequests() {
  yield takeLatest(FETCH_DATA_FROM_LINEAR, fetchDataFromLinear);
  yield takeLatest(UPDATE_RESPONSE, createTasksFromGroq);
  yield takeLatest(LOGOUT, handleLogOut);
  yield takeLatest(LOGIN, fetchDataAfterLogin);
  yield takeLatest(LOGIN_REQUEST, startOAuthSaga);
  yield takeLatest(HANDLE_CALLBACK, handleCallbackSaga);
}

export function* createTasksFromGroq(action: {
  type: typeof UPDATE_RESPONSE;
  payload: any;
}) {
  const data = JSON.parse(action.payload);
  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // Generate unique ID function
  function generateUniqueId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  let currentDueDate = new Date();
  const tasks = data.tasks?.map((task: any) => {
    currentDueDate.setDate(currentDueDate.getDate() + task.daysRequired);
    const taskDueDate = new Date(currentDueDate);
    return {
      ...task,
      id: generateUniqueId(), // Add unique ID to each task
      dueDate: formatDate(taskDueDate),
    };
  });

  tasks.reverse();

  try {
    const state = store.getState();
    const { teamId } = state.user;
    const accessToken = state.auth.access_token;
    //@ts-ignore
    const response = yield call(axios.post, `${API_BASE_URL}/create`, {
      tasks,
      teamId,
      accessToken,
    });
    //`http://localhost:3000/api/create`, {
    if (response.data.success) {
      for (const task of tasks) {
        const logData = {
          team_id: teamId,
          task_id: task.id, // Now using our generated ID
          log_type: 'TASK_CREATED' as const,
          details: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            daysRequired: task.daysRequired,
            id: task.id
          }
        };
        
        yield call(() => loggingService.createLog(logData));
      }
            yield call(navigateTo, "/");
      yield put(
        setToastSuccess("Successfully created Tasks for your App Idea")
      );
      yield put({ type: RESET_FORM });
    } else {
      console.error("Error creating tasks:", response.data.error);
    }
  } catch (error) {
    console.error("Error sending to server:", error);
  }
}

export function* handleLogOut() {
  try {
    // Get access token from state
    const state = store.getState();
    const accessToken =  getCookie("linearAccessToken")

    console.log("ACCTOK>>>>", state, getCookie("linearAccessToken"));

    if (getCookie("linearAccessToken")) {
      yield call(axios.post, 'https://api.linear.app/oauth/revoke', {
        token: accessToken
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }

    yield call(clearSpecificCookie, "linearAccessToken");
    localStorage.removeItem("teamId");
    localStorage.removeItem('hasLoggedInLinear');
    window.open('https://linear.app/logout', '_blank');
    yield call(navigateTo, "/");
  } catch (error) {
    console.error('Logout error:', error);
    yield call(clearSpecificCookie, "linearAccessToken");
    localStorage.removeItem("teamId");
    localStorage.removeItem('hasLoggedInLinear');
    yield call(navigateTo, "/");
  }
}

function* startOAuthSaga() {
  const { linearClientId, redirectUri } = configs;
  
  // First, direct users to authenticate with Linear
  const oauth_url = `https://linear.app/oauth/authorize?client_id=${linearClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read,write,admin`;
  window.location.href = `https://linear.app/login?redirectTo=${encodeURIComponent(oauth_url)}`;
}

function* handleCallbackSaga(action: AuthActionTypes) {
  try {
    if (action.type === HANDLE_CALLBACK) {
      const code = action.payload;

      const { linearClientSecret, linearClientId, redirectUri } = configs;
      //@ts-ignore
      const response = yield call(
        axios.post,
        "https://api.linear.app/oauth/token",
        {
          client_id: linearClientId,
          client_secret: linearClientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const data = response.data;

      if (response.status === 200 && data.access_token) {
        const expirationDays = 7;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationDays);
        document.cookie = `linearAccessToken=${
          data.access_token
        }; path=/; expires=${expirationDate.toUTCString()};SameSite=Lax`;
        yield put(loginSuccess(data.access_token));
      } else {
        throw new Error(data.error || "OAuth failed");
      }
    }
  } catch (error) {
    console.error(error);
    const { linearClientId, redirectUri } = configs;
    window.location.href= `https://linear.app/oauth/authorize?client_id=${linearClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read,write,admin`;
  }
}

export function* fetchDataAfterLogin(action: {
  type: typeof LOGIN;
  payload: string;
}) {
  try {
    const data = yield call(
      axios.post,
      `${API_BASE_URL}/getLinearData`,
      //"http://localhost:3000/api/getLinearData",
      {
        accessToken: action.payload,
      }
    );
    const { user, teamId } = data.data;
    localStorage.setItem("teamId", teamId);
    yield put(setUserDetails(user, teamId));
    navigateTo("/dashboard");
  } catch (error) {
    console.error("Failed to fetch Linear data:", error);
  }
}

export function* fetchDataFromLinearAndCreateLogs() {
  try {
    const state = store.getState();
    const teamId = state.user.teamId || localStorage.getItem("teamId");
    const accessToken = state.auth.access_token;
    //@ts-ignore
    const response = yield call(axios.post, `${API_BASE_URL}/fetch`, {
      teamId,
      accessToken,
    });
    //"http://localhost:3000/api/fetch"
    if (response.data.success) {
      yield put(storeTasks(response.data.data));
      const tasks = response.data.data;
      // Log each task after fetching
      for (const task of tasks) {
        const logData = {
          team_id: teamId,
          task_id: task.id, // Linear provided ID
          log_type: 'TASK_CREATED' as const,
          details: {
            title: task.title,
            description: task.description,
            state: task.state,
            id: task.id,
            priority: task.priority,
            assignee: task.assignee,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }
        };
        
        yield call(() => loggingService.createLog(logData));
      }
    } else {
      console.error("Error fetching tasks:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching from server:", error);
    yield put(
      setToastFailure("Error in fetching tasks, kindly reload the page.")
    );
  }
}


export function* fetchDataFromLinear() {
  try {
    const state = store.getState();
    const teamId = state.user.teamId || localStorage.getItem("teamId");
    const accessToken = state.auth.access_token;
    //@ts-ignore
    const response = yield call(axios.post, `${API_BASE_URL}/fetch`, {
      teamId,
      accessToken,
    });
    //"http://localhost:3000/api/fetch"
    if (response.data.success) {
      yield put(storeTasks(response.data.data));
    } else {
      console.error("Error fetching tasks:", response.data.error);
    }
  } catch (error) {
    console.error("Error fetching from server:", error);
    yield put(
      setToastFailure("Error in fetching tasks, kindly reload the page.")
    );
  }
}