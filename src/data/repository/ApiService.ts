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
    @GET("generic")
    async getApiResult(
        @Query("query") queryId: String,
        @Query("size") sizeId: number,
        @Query("source") sourceId: String,
        @Query("page") pageId: number,
        @Query("service") service: String = "codesnippets",
        @Query("version") version: String = "1",
        @Query("fields") fields: String = "snippet_code%2Curl"
    ): Promise<Response<SearchResponse>> {
        return <Response<SearchResponse>> {};
    }
}