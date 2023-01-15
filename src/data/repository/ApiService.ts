import { GET, POST, PUT, PATCH, DELETE, BasePath, Header, Path, Body, BaseService, ServiceBuilder, Response, Query, Headers } from "ts-retrofit";


export interface Result {
    snippet_code: string;
    url: string;
}

export interface SearchResults {
    results: Result[];
}

export interface SearchResponse {
    page: number;
    searchResults: SearchResults;
}


export class ApiService extends BaseService {
    @Headers({
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "youide"
      })
    @GET("generic?version=1&fields=snippet_title%2Csnippet_code%2Csource%2Clanguage%2Curl%2Code_snippets&size=1")
    async getApiResult(
        @Query("query") queryId: String,
        @Query("size") sizeId: number,
        @Query("source") sourceId: String,
        @Query("page") pageId: number
    ): Promise<Response<SearchResponse>> {
        return <Response<SearchResponse>>{};
    }
}