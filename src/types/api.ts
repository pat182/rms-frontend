export type ApiErrorItem = {
    loc?: (string | number)[];
    msg?: string;
    type?: string;

};
export type ApiError = {
    detail?: string | ApiErrorItem[];
};