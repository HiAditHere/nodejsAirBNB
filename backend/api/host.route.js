import express from "express"
import hostsCtrl from "./hosts.controller.js"
import reviewsCtrl from "./reviews.controller.js"

const router = express.Router()

//router.route("/").get((req, res) => res.send("hello World"))
router.route("/").get(hostsCtrl.apiGetHosts)
router.route("/id/:id").get(hostsCtrl.apiGetHostById)
router.route("/propertyTypes").get(hostsCtrl.apiGetPropertyTypes)

router
    .route("/review")
    .post(reviewsCtrl.apiPostReview)
    .put(reviewsCtrl.apiUpdateReview)
    .delete(reviewsCtrl.apiDeleteReview)

export default router