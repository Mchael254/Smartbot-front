export const setToken =  (access_token:string, refresh_token:string) => {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
}
