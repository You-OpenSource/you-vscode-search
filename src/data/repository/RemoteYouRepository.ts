/* eslint-disable @typescript-eslint/naming-convention */
import { EMPTY, Observable } from "rxjs";
import { RequestConfig, RequestInterceptorFunction, Response, ServiceBuilder } from "ts-retrofit";
import { getTelemetry } from "../../telemetry";
import { ApiService, SearchResponse } from "./ApiService";

const myLogCallback = (config: RequestConfig, response: Response) => {
    const log = `[${config.method}] ${config.url} ${response.status}  ${JSON.stringify(response.data)}`;
    console.log(log);
};

const RequestInterceptor: RequestInterceptorFunction = (config) => {
    console.log("Before sending request to server.");
    return config;
  };

const apiService = new ServiceBuilder().setEndpoint("https://you.com/api/")
    .setLogCallback(myLogCallback)
    .setStandalone(true)
    .setRequestInterceptors(RequestInterceptor)
    .build(ApiService);

export default {

    getCodeSuggestions(request: SolutionRequest): Observable<SearchResponse> {

        if (request.codeLine === null) {
            return EMPTY;
        }
        return new Observable((observer) => {
            getTelemetry().send({
                name: "vscode_user_search",
                type: "track",
                properties: {
                    "search.param": request.codeLine,
                }
            });


            apiService.getApiResult(request.codeLine, 15, "codesnippets", 1).then((response) => {
                observer.next(response.data);
                if (response.data.searchResults.results.length === 0) {
                    getTelemetry().send({
                        name: "vscode_user_search",
                        type: "track",
                        properties: {
                            "search.param": request.codeLine,
                        }
                    });
                }
                observer.complete();
            },
                (error) => {
                    getTelemetry().send({
                        name: "vscode_user_search_failed",
                        type: "track",
                        properties: {
                            "search.param": request.codeLine,
                            error: error + ''
                        }
                    });
                    observer.error(error);
                });
        });

    }
};

