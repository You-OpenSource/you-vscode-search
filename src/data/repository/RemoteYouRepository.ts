import { EMPTY, Observable } from "rxjs";
import { GET, POST, PUT, PATCH, DELETE, BasePath, Header, Path, Body, BaseService, ServiceBuilder, Response, RequestConfig } from "ts-retrofit";
import { ApiService, SearchResponse } from "./ApiService";

const myLogCallback = (config: RequestConfig, response: Response) => {
    const log = `[${config.method}] ${config.url} ${response.status}`;
    console.log(log);
  };

const apiService = new ServiceBuilder().setEndpoint("https://you.com/api/")
    .setLogCallback(myLogCallback)
    .build(ApiService);

export default {

    getCodeSuggestions(request: SolutionRequest): Observable<SearchResponse> {
        if(request.codeLine === null) {
            return EMPTY;
        }
        return new Observable((observer) => {
            observer.next({
                page: 1,
                searchResults: {
                    results: [
                        {
                            snippet_code: "test",
                            url: "test"
                        },
                        {
                            snippet_code: "test2",
                            url: "test"
                        }
                    ]
                }
            });
            observer.complete();
            // apiService.getApiResult(request.codeLine, 15, "codesnippets", 1).then((response) => {
            //     observer.next(response.data);
            //     observer.complete();
            // },
            // (error) => {
            //     observer.error(error);
            //  });
        });

    }
};

