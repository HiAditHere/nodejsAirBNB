import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId

let hosts

export default class hostsDAO{
    static async injectDB(conn) {
        if(hosts){
            return
        }
        try {
            hosts = await conn.db(process.env.RESTREVIEWS_NS).collection("listingsAndReviews")
        } catch(e) {
            console.error(
                `Unable to establish a collection handle in hostsDAO:${e}`,
            )
        }
    }

    static async getHosts({
        filters = null,
        page = 0,
        hostsPerPage = 20,
    } = {}) {
        console.log(filters)
        var query = {}
        let query1, query2, query3
        if(filters){
            if("name" in filters){
                query = {$text: {$search: filters['name']}}
            } if("property_type" in filters){
                query["property_type"] = {$eq: filters['property_type']}
            } if("country" in filters) {
                query["address.country"] = {$eq: filters["country"]}
            }
        }

        console.log("1")
        console.log(query)
        let cursor

        try{
            cursor = await hosts
                .find(query)
        } catch (e) {
            console.error(`Unable to issue find command , ${e}`)
            return {hostsList: [], totalNumHosts: 0}
        }

        const displayCursor = cursor.limit(hostsPerPage).skip(hostsPerPage * page)

        try {
            const hostsList = await displayCursor.toArray()
            const totalNumHosts = await hosts.countDocuments(query)

            return{ hostsList, totalNumHosts}
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`
            )
            return {hostsList: [], totalNumHosts: 0}
        }
    } 

    static async getHostById(id) {
        try{
            const pipeline = [
                {
                    $match: {
                        _id: id
                    },
                },

                {
                    $lookup: {
                        from: "reviews",
                        let: {
                            id: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$host_id", "$$id"],
                                    },
                                },
                            },
                            {
                                $sort: {
                                    date: -1,
                                },
                            },
                        ],
                        as: "reviews",
                    }
                },
                {
                    $addFields: {
                        reviews: "$reviews",
                    },
                }
            ]
            return await hosts.aggregate(pipeline).next()
        } catch (e) {
            console.error(`Something went wrong in getHostById, ${e}`)
            throw e
        }
    }

    static async getPropertyTypes() {
        let pt = []

        try{
            pt = await hosts.distinct("property_type")
            return pt
        } catch(e) {
            console.error(`Unable to get the property types, ${e}`)
            return pt
        }
    }
}