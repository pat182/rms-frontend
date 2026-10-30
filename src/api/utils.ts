import {ApiError} from "../types/api.ts"

export function getCookie(name:string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }

  return null;
}


export async function getApiErrorMessage(
    response: Response
): Promise<string> {
    const error: ApiError = await response
        .json()
        .catch(() => ({}));

    if (typeof error.detail === "string") {
        return error.detail;
    }

    if (Array.isArray(error.detail)) {
        return error.detail
            .map((item) => {
                const field = item.loc?.at(-1);

                if (item.type === "missing") {
                    return `${field ?? "Field"} is required.`;
                }

                return item.msg ?? "Invalid input.";
            })
            .join(" ");
    }

    return `Request failed (${response.status}). Please try again.`;
}


export async function saveMenuItemsHelper(
  menuId: number,){
    
}