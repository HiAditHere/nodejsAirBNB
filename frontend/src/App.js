import React from "react";
import {Switch, Route, Link} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from './logo.svg';
import './App.css';
import { useHistory } from "react-router";

import AddReview from "./components/add-review";
import hostsList from "./components/host-list";
import Host from "./components/host";
import Login from "./components/login";

function App() {

  const history = useHistory();
  const [user, setUser] = React.useState(null);

  async function login(user = null){
    setUser(user);
    history.push('/');
  }

  async function logout(){
    setUser(null);
  }

  return (
    <div className="App">
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
              <a class="navbar-brand" href="/hosts">Hosts</a>
              
              <div className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link to={"/hosts"} className="nav-link">
                    Hosts
                  </Link>
                </li>

                <li className="nav-item">
                  {user ? (
                    <a onClick={logout} className="nav-link" style={{cursor:'pointer'}}>
                      Logout {user.name}
                    </a>
                  ) : (
                    <Link to = {"/login"} className="nav-link">
                      Login
                    </Link>
                  )}
                </li>
              </div>
            </nav>

            <div className="container mt-3">
              <Switch>
                <Route exact path = {["/", "/hosts"]} component={hostsList}/>
                
                <Route 
                  path="/hosts/:id/review"
                  render={(props) => (
                    <AddReview {...props} user={user} />
                  )}
                />

                <Route 
                  path="/hosts/:id"
                  render={(props) => (
                    <Host {...props} user={user} />
                  )}
                />

                <Route 
                  path="/login"
                  render={(props) => (
                    <Login {...props} login={login} />
                  )}
                />
              </Switch>
            </div>
    </div>
  );
}

export default App;
