// Constants shared across the Open SWE platform
export const MANAGER_GRAPH_ID = "manager";
export const PLANNER_GRAPH_ID = "planner";
export const REVIEWER_GRAPH_ID = "reviewer";

export const DO_NOT_RENDER_ID_PREFIX = "__do_not_render__";
export const PLAN_INTERRUPT_ACTION_TITLE = "Plan Review Required";

export const GITHUB_TOKEN_COOKIE = "github_token";
export const GITHUB_INSTALLATION_ID_COOKIE = "github_installation_id";
export const GITHUB_AUTH_STATE_COOKIE = "github_auth_state";

export const OPEN_SWE_STREAM_MODE = "stream";

export const PLAN_APPROVED_ACTION_TITLE = "Plan Approved";
export const PLAN_REJECTED_ACTION_TITLE = "Plan Rejected";

export const DEFAULT_THREAD_TITLE = "New Thread";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";