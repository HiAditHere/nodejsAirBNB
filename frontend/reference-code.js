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
        let query
        if(filters){
            if("name" in filters){
                query = {$text: {$search: filters['name']}}
            } else if("property_type" in filters){
                query = {"property_type": {$eq: filters['property_type']}}
            } else if("country" in filters) {
                query = {"address.country": {$eq: filters["country"]}}
            }
        }

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


import React, {useState, useEffect, Image} from "react";
import hostDataService from "../services/hosts";
import {Link} from "react-router-dom";
//import {Image} from "react-native";
import "../css/styles.css"

const HostsList = (props) => {
  const [hosts, setHosts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [propertyTypes, setPropertyTypes] = useState(["All Cuisines"]);

  useEffect(() => {
    retrieveHosts();
    retrievePropertyTypes();
  }, []);

  const onChangeSearchName = e => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchCountry = e => {
    const searchCountry = e.target.value;
    setSearchCountry(searchCountry);
  }

  const onChangeSearchPropertyType = e => {
    const searchPropertyType = e.target.value;
    setSearchPropertyType(searchPropertyType);
  }

  const retrieveHosts = () => {
    hostDataService.getAll()
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };
  
  const retrievePropertyTypes = () => {
    hostDataService.getPropertyTypes()
    .then(response => {
      console.log(response.data);
      setPropertyTypes(["All Type of Apartments"].concat(response.data));
    })
    .catch(e => {
      console.log(e);
    });
  };

  const refreshList = () => {
    retrieveHosts();
  }

  const find = (query, by) => {
    hostDataService.find(query, by)
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };

  const findByName = () => {
    find(searchName, "name")
  };

  const findByCountry = () => {
    find(searchCountry, "country")
  };

  const findByProprtyType = () => {
    if(searchPropertyType === "All Properties"){
      refreshList();
    } else {
      find(searchPropertyType, "property_type")
    }
  };

  return (
    <div>
  
      <div className="row pb-3">
        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by name"
            value = {searchName}
            onChange = {onChangeSearchName}
            />
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByName}
              >
                Search
              </button>
          </div>
        </div>

        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by country"
            value = {searchCountry}
            onChange = {onChangeSearchCountry}
            />
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByCountry}
              >
                Search
              </button>
          </div>
        </div>

        <div className = "input-group col-lg">
          <select onChange={onChangeSearchPropertyType} className = "col">
            {propertyTypes.map(propertyType => {
              return (
                <option value = {propertyType}> {propertyType.substr(0, 20)} </option>
              )
            })}
          </select>
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByProprtyType}
              >
                Search
              </button>
          </div>
        </div>

      </div>

      <div className="row">
        {hosts.map((host) => {
          const address = `${host.address.street} ${host.address.suburb} ${host.address.government_area} ${host.address.country}`
          /*return (
            <div className="col-lg-4 pb-1">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{host.name}</h5>
                  <p className="card-text">
                    <strong>Property Type: </strong> {host.property_type}<br/>
                    <strong>Address: </strong> {address}
                  </p>
                  <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                  </div>
                </div>
              </div>
            </div>
          ); */

          //<img src={host.images.picture_url} class="card-img-top" alt="..."/>
          //style="width: 18rem;">

          return (
            <div className="col-lg-4 pb-1">
            <div className="card">
            <img src={host.images.picture_url} class="card-img-top img-fluid" alt="..." className="photo"/>  
              <div className="card-body">
                <h5 className="card-title">{host.name}</h5>
                <p className="card-text">{address}</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Property Type: </strong>{host.property_type}</li>
                <li className="list-group-item"><strong>Bedrooms: </strong>{host.bedrooms}</li>
              </ul>
              <div class="card-body">
                <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

    </div>
  );


};

export default HostsList;

import React, {useState, useEffect, Image} from "react";
import hostDataService from "../services/hosts";
import {Link} from "react-router-dom";
//import {Image} from "react-native";
import "../css/styles.css"

const HostsList = (props) => {
  const [hosts, setHosts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [propertyTypes, setPropertyTypes] = useState(["All Cuisines"]);

  useEffect(() => {
    retrieveHosts();
    retrievePropertyTypes();
  }, []);

  const onChangeSearchName = e => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchCountry = e => {
    const searchCountry = e.target.value;
    setSearchCountry(searchCountry);
  }

  const onChangeSearchPropertyType = e => {
    const searchPropertyType = e.target.value;
    setSearchPropertyType(searchPropertyType);
  }

  const retrieveHosts = () => {
    hostDataService.getAll()
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };
  
  const retrievePropertyTypes = () => {
    hostDataService.getPropertyTypes()
    .then(response => {
      console.log(response.data);
      setPropertyTypes(["All Type of Apartments"].concat(response.data));
    })
    .catch(e => {
      console.log(e);
    });
  };

  const refreshList = () => {
    retrieveHosts();
  }

  const find = (query, by) => {
    hostDataService.find(query, by)
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };

  const findByName = () => {
    find(searchName, "name")
  };

  const findByCountry = () => {
    find(searchCountry, "country")
  };

  const findByProprtyType = () => {
    if(searchPropertyType === "All Properties"){
      refreshList();
    } else {
      find(searchPropertyType, "property_type")
    }
  };

  return (
    <div>
  
      <div className="row pb-3">
        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by name"
            value = {searchName}
            onChange = {onChangeSearchName}
            />
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByName}
              >
                Search
              </button>
          </div>
        </div>

        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by country"
            value = {searchCountry}
            onChange = {onChangeSearchCountry}
            />
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByCountry}
              >
                Search
              </button>
          </div>
        </div>

        <div className = "input-group col-lg">
          <select onChange={onChangeSearchPropertyType} className = "col">
            {propertyTypes.map(propertyType => {
              return (
                <option value = {propertyType}> {propertyType.substr(0, 20)} </option>
              )
            })}
          </select>
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findByProprtyType}
              >
                Search
              </button>
          </div>
        </div>

      </div>

      <div className="row">
        {hosts.map((host) => {
          const address = `${host.address.street} ${host.address.suburb} ${host.address.government_area} ${host.address.country}`
          /*return (
            <div className="col-lg-4 pb-1">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{host.name}</h5>
                  <p className="card-text">
                    <strong>Property Type: </strong> {host.property_type}<br/>
                    <strong>Address: </strong> {address}
                  </p>
                  <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                  </div>
                </div>
              </div>
            </div>
          ); */

          //<img src={host.images.picture_url} class="card-img-top" alt="..."/>
          //style="width: 18rem;">

          return (
            <div className="col-lg-4 pb-1">
            <div className="card">
            <img src={host.images.picture_url} class="card-img-top img-fluid" alt="..." className="photo"/>  
              <div className="card-body">
                <h5 className="card-title">{host.name}</h5>
                <p className="card-text">{address}</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Property Type: </strong>{host.property_type}</li>
                <li className="list-group-item"><strong>Bedrooms: </strong>{host.bedrooms}</li>
              </ul>
              <div class="card-body">
                <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

    </div>
  );


};

export default HostsList;