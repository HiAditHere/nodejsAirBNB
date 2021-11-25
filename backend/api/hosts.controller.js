import hostsDAO from "../dao/hostsDAO.js";

export default class hostsController {
    static async apiGetHosts(req, res, next) {
        console.log(req.query);
        const hostsPerPage = req.query.hostsPerPage ? parseInt(req.query.hostsPerPage, 10) : 20
        const page = req.query.page ? parseInt(req.query.page, 10): 0

        let filters = {}
        if(req.query.name) {
            filters.name = req.query.name
        }if (req.query.country) {
            filters.country = req.query.country
        }if (req.query.property_type) {
            filters.property_type = req.query.property_type
        }

        const { hostsList, totalNumHosts} = await hostsDAO.getHosts({
            filters,
            page,
            hostsPerPage,
        })

        let response = {
            hosts: hostsList,
            page: page,
            filters: filters,
            entries_per_page: hostsPerPage,
            total_results: totalNumHosts
        }
        res.json(response)
    }

    static async apiGetHostById (req, res, next) {
        try{
            let id = req.params.id || {}
            let host = await hostsDAO.getHostById(id)

            if(!host) {
                res.status(404).json({error: "Not founds"})
                console.log("ERRS")
                return
            }
            res.json(host)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }

    static async apiGetPropertyTypes(req, res, next) {
        try{
            let type = await hostsDAO.getPropertyTypes()
            res.json(type)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }
}