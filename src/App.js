/*
Copyright 2016 Sigfried Gold

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import React, { Component } from 'react';

import { /*Route, RouteHandler, */ Link } from 'react-router';
import { Nav, Navbar, //Modal,
         NavItem, //Button,
         Row, Col, Glyphicon,
         // NavDropdown, MenuItem, Panel, Button, 
          } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Inspector from 'react-json-inspector';
import 'react-json-inspector/json-inspector.css';
import {FilterForm} from './components/Filters';
import Draggable from 'react-draggable'; // The default
import VocabPop from './components/VocabPop';
          /* Search, DrugContainer, Tables, */
import * as AppState from './AppState';
var $ = require('jquery');


//import logo from './logo.svg';
//import './App.css';
import './stylesheets/VocabPop.css';
import _ from 'supergroup';
//import * as AppState from './AppState';
//import * as util from './ohdsi.util';
import {commify} from './utils';

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.stateSub = AppState.subscribeState('', state => this.setState(state));
  }
  componentWillUnmount() {
    this.stateSub.unsubscribe();
  }
  render() {
    //const {filters, domain_id} = this.props;
    var conceptCount = this.state.conceptCount || 0;
    console.log(this.props);
    return  <div>
              {/*
              <div>
                <VocabPop filters={filters} domain_id={domain_id} />
              </div>
              */}
              <Inspector search={false} 
                data={ AppState.getState() } />
              <br/>
              Current concepts: { commify(conceptCount) }
            </div>;
  }
}
function locPath(pathname, opts={}) {
  // not sure whether to get state from AppState.getState()
  // here. this does the same:
  let search = AppState.myqs.parse(location.search.substr(1));
  if (opts.clear) {
    opts.clear.forEach(param=>delete search[param]);
  }
  if (opts.params) {
    _.each(opts.params, (v,p) => search[p] = v);
  }

  let loc = Object.assign({}, location, {pathname});
  loc.search = '?' + AppState.myqs.stringify(search);
  return loc;
}
class DefaultNavBar extends Component {
  render() {
    return (
        <Navbar fluid={true} fixedTop={false} collapseOnSelect={true} >
          <Navbar.Header>
            <Navbar.Brand>
              <NavLink to={locPath('/',{clear:['domain_id']})} onlyActiveOnIndex>
                Vocab Viz
              </NavLink>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav >
              <LinkContainer to={locPath('/concepts',{params:{domain_id:'Drug'}})}>
                <NavItem eventKey={1}>Drug</NavItem>
              </LinkContainer>
              <LinkContainer to={locPath('/concepts',{params:{domain_id:'Condition'}})}>
                <NavItem eventKey={1}>Condition</NavItem>
              </LinkContainer>
              <LinkContainer to={locPath('/concepts',{clear:['domain_id']})}>
                <NavItem eventKey={1}>All Domains</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    );
  }
}
class NavLink extends Component {
  render() {
    return <Link {...this.props} activeClassName="active"/>
  }
}
/*
const ModalWrapper = ({children, title, closeFunc}) => {
  return (
      <Modal bsSize="lg"
          dialogClassName="sidebar-modal"
          show={true} 
          onHide={closeFunc}
          >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {children}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeFunc}>Close</Button>
        </Modal.Footer>
      </Modal>
  );
};
*/
class DraggableWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
                    activeDrags: 0,
                    deltaPosition: {
                      x: 0, y: 0
                    },
                };
    //console.log(this.state);
  }
  handleDrag(e, ui) {
    //console.log(this.state);
    const {x, y} = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  }
  handleStart() {
    this.setState({activeDrags: ++this.state.activeDrags});
  }
  handleStop() {
    this.setState({activeDrags: --this.state.activeDrags});
  }

  render() {
    const {children, title, closeFunc} = this.props;
    return <Draggable 
                    handle=".handle"
                    defaultPosition={{x: 400, y: 200}}
                    position={null}
                    //grid={[25, 25]}
                    //zIndex={99999}
                    onStart={this.handleStart.bind(this)}
                    onDrag={this.handleDrag.bind(this)}
                    onStop={this.handleStop.bind(this)}>
                  <div className="box no-cursor">
                    <div className="cursor handle">
                      <span>
                        {title}
                      </span>
                      <span style={{float:'right', cursor:'pointer'}}>
                        <Glyphicon glyph="remove" 
                          onClick={closeFunc}
                        />
                      </span>
                    </div>
                    {children}
                  </div>
                </Draggable>;
    /*
    return (
        <Modal bsSize="lg"
            dialogClassName="sidebar-modal"
            show={true} 
            onHide={closeFunc}
            >
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {children}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={closeFunc}>Close</Button>
          </Modal.Footer>
        </Modal>
    );
    */
  }
};
const Settings = ({props}) => <h4>Settings</h4>;
const History = ({props}) => <h4>History</h4>;
const DataLoaded = ({props}) => <h4>DataLoaded</h4>;

  

export class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      component: <h4>nothing loaded</h4>,
      title: 'waiting for content',
    };
  }
  closeModal() {
    this.setState({ showModal: false });
  }
  openModal(componentName) {
    this.setState({ 
      showModal: true,
      component: ({
                    settings: <Settings/>,
                    filters: <FilterForm/>,
                    history: <History/>,
                    dataLoaded: <DataLoaded/>,
                  })[componentName],
      title: componentName,
    });
  }
  render() {
    const {showModal, component, title} = this.state;
    let content = '';
    if (showModal) {
      /*
      content = <Draggable 
                    handle=".handle"
                    defaultPosition={{x: 300, y: 0}}
                    position={null}
                    grid={[25, 25]}
                    zIndex={100}
                    onStart={this.handleStart}
                    onDrag={this.handleDrag}
                    onStop={this.handleStop}>
                  <div>
                    <div className="handle">{title}</div>
                      {component}
                  </div>
                </Draggable>;
      content = <ModalWrapper 
                      title={title}
                      closeFunc={this.closeModal.bind(this)}>
                  {component}
                </ModalWrapper>;
      */
      content = <DraggableWrapper 
                      title={title}
                      closeFunc={this.closeModal.bind(this)}>
                  {component}
                </DraggableWrapper>;
    }
    return (
      <div>
        {content}
        <Nav
            stacked activeKey={1} onSelect={this.openModal.bind(this)} >
            <NavItem eventKey={'settings'}>Settings</NavItem>
            <NavItem eventKey={'filters'}>Filters</NavItem>
            <NavItem eventKey={'history'}>History</NavItem>
            <NavItem eventKey={'dataLoaded'}>Data loaded</NavItem>
          {/*
          */}
        </Nav>
      </div>
    );
  }
  showModal(which) {
  }
}
export class ComponentWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { comingFrom: "CompWrapper", updates: 0,};
  }
  componentDidMount() {
    //this.setState({contentDiv:this.contentDiv});
    this.getSize();
  }
  componentDidUpdate() {
    this.getSize();
  }
  getSize() {
    if (this.contentDiv) {
      const {w,h} = this.state;
      // maybe ComponentWrapper will end up too general for this
      // specific way of getting div dimensions, but it should work
      // for now
      let cbr = this.contentDiv.getBoundingClientRect(),
          rw = Math.round(cbr.width),

          rh = Math.round($(this.contentDiv)
                           .closest('.flex-remaining-height')
                           .height());
      if (w !== rw || h !== rh) {
        this.setState({w:rw, h:rh, updates: this.state.updates+1});
      }
    }
  }
  render() {
    let {filters} = AppState.getState();
    let domain_id = AppState.getState('domain_id');
    let props = {
      filters, domain_id,
    };
    Object.assign(props, this.props, this.state);
    const Comp = ({
      VocabPop: VocabPop,
      Home: Home,
      //Search: Search,
    })[this.props.route.components.compName];
    // w,h will be sent down to Comp as props!!!! 
    return  <div className="main-content" ref={d=>this.contentDiv=d} >
              <Comp {...props} classNames="" />
            </div>;
  }
}
export class App extends Component {
  render() {
    const {main, sidebar} = this.props;
    let NavBar = DefaultNavBar;
    return (
      <div className="vocab-app flex-box">
        <div className="flex-content-height" >
          <NavBar />
        </div>
        <Row className="flex-remaining-height">
          <Col xs={2} md={2} className="sidebar">
            {sidebar}
          </Col>
          <Col xs={10} md={10} >
            {main}
          </Col>
        </Row>
      </div>
    );
  }
}
