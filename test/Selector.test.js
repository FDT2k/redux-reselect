import '@babel/polyfill'
import {bindSelectorToState,bindSelectorsToState,bindCreatorToState,bindCreatorsToState} from '../src/index';
import {createSelector} from 'reselect'

import {curry,supertrace,flip} from '@geekagency/composite-js'

test ('bindSelectorToState',()=>{
  let selector = (state)=>{
    return state;
  }

  let getState = ()=>{
    return {
      "hello": "world"
    }
  }

  let hello = bindSelectorToState(getState)(selector);

  expect (hello()).toEqual({
       "hello": "world",
     }
   )

})

test ('bindSelectorsToState',()=>{
  let selectors = {
    a: (state)=> state,
    b: {
      c:(state)=>{return state},
      d:(state)=>state
    }
  }

  let getState = ()=>{

    return {
      "hello": "world"
    }
  }

  let expected = {
       "hello": "world",
     }

  let bound = bindSelectorsToState(getState)(selectors)

  expect(typeof(bound)).toBe('object')
  expect(typeof(bound.a)).toBe('function')
  expect(typeof(bound.b)).toBe('object')
  expect(typeof(bound.b.c)).toBe('function')
  expect(typeof(bound.b.d)).toBe('function')

  expect(bound.a()).toEqual(expected);
  expect(bound.b.d()).toEqual(expected);
  expect(bound.b.c()).toEqual(expected);
})


test ('bind Selector Creator',()=>{
  let getState = ()=>{
    return [
      {returns:'yes',test:'world'},
      {returns:'no',test:'world2'}
    ]
  }

  let expected = {
       "hello": "world",
  }

  let baseSelector = state => state;

  let creator = _filter => {
//    console.log('creator filter',_filter)
    return createSelector(
      baseSelector,
      base=> {
  //      console.log('final state',base)
        //return base
        return base.filter(item=>item.returns ==_filter)
    })
  }



  let boundSelectorCreator = bindCreatorToState(getState)(creator);
  //now it waits for NO ARGS
//  console.log(boundSelectorCreator('yes') )

  expect(boundSelectorCreator('yes')()).toEqual([
    {returns:'yes',test:'world'}
  ])
  expect(boundSelectorCreator('no')()).toEqual([
    {returns:'no',test:'world2'}
  ])

})


test ('bindCreatorsToState',()=>{
    let baseSelector = state => state;
  let creator = _filter => {
//    console.log('creator filter',_filter)
    return createSelector(
      baseSelector,
      base=> {
  //      console.log('final state',base)
        //return base
        return base.filter(item=>item.returns ==_filter)
    })
  }

  let selectors = {
    a: creator,
    b: {
      c:creator,
      d:creator
    }
  }

  let getState = ()=>{

    return [
      {returns:'yes',test:'world'},
      {returns:'no',test:'world2'}
    ]
  }

  let expectedyes =  [{"returns": "yes", "test": "world"}]

 let expectedno =   [  {returns:'no',test:'world2'}]


  let bound = bindCreatorsToState(getState)(selectors)

  expect(typeof(bound)).toBe('object')
  expect(typeof(bound.a)).toBe('function')
  expect(typeof(bound.b)).toBe('object')
  expect(typeof(bound.b.c)).toBe('function')
  expect(typeof(bound.b.d)).toBe('function')

  expect(bound.a('yes')()).toEqual(expectedyes);
  expect(bound.b.d('no')()).toEqual(expectedno);
  expect(bound.b.c('yes')()).toEqual(expectedyes);
})
