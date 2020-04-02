/**
 *
 * @param resCode The status code response to client
 * @param resResult Data response to client
 */
export const responseData = (resCode: number, resResult: any) => {
	return { resCode, resResult };
};
