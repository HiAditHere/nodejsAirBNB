import http from "./http-comment";

class hostDataService {
    getAll(page = 0) {
        return http.get(`?page=${page}`)
    }

    get(id) {
        return http.get(`/id/${id}`);
    }

    find(query, page = 0) {
        //return http.get(`?${by}=${query}&page=${page}`);
        console.log(query);
        return http.get(`?${query}&page=${page}`);
    }

    createReview(data) {
        return http.post("/review", data);
    }

    updateReview(data){
        return http.post("/review", data);
    }

    deleteReview(id, userId){
        return http.delete(`/review?id=${id}`, {data: {user_id: userId}});
    }

    getPropertyTypes(id){
        return http.get("propertyTypes");
    }
}

export default new hostDataService();