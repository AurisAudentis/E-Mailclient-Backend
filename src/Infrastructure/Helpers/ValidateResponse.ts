
export function validateResponse(response) {
    if(response.statusCode >= 400) {
        throw {message: response.body.message, err: response.body.err, status: response.statusCode};
    }
    return response;
}