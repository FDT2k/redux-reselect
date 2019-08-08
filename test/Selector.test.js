import '@babel/polyfill'
import {bindSelectorToState,bindSelectorsToState,makeBindableSelectorCreator} from '../src/index';
import {createSelector} from 'reselect'

import {curry} from '@geekagency/composite-js'

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
    console.log('creator filter',_filter)
    return createSelector(
      baseSelector,
      base=> {
        console.log('final state',base)
        //return base
        return base.filter(item=>item.returns ==_filter)
    })
  }

  let makeSelector = makeBindableSelectorCreator(creator);
  //now makeSelector is waitinng for GetState function
  let boundSelectorCreator = bindSelectorToState(getState)(makeSelector)();
  //now it waits for NO ARGS
  console.log(boundSelectorCreator('yes') )

  expect(boundSelectorCreator('yes')()).toEqual([
    {returns:'yes',test:'world'}
  ])
  expect(boundSelectorCreator('no')()).toEqual([
    {returns:'no',test:'world2'}
  ])

})

test('curried selectorCreator',()=>{

  let baseSelector = state => state;

  let creator =  curry ((_filterA,_filterB) => {
    console.log('creator filter',_filterA,_filterB)
    return createSelector(
      baseSelector,
      base=> {
        console.log('final state',base)
        //return base
        return base.filter(item=>item.returns ==_filterA)
    })
  })
  //Signature is now Creator:: filterA => filterB => Selector
  let state = ()=> [{returns:'a',test:'horde'},{returns:'b',test:'horder'}];
  let selector = creator('a','b')
  console.log(selector(state()))


  let bindableCreator = makeBindableSelectorCreator(creator);

  let bound = bindSelectorToState(state)

  console.log(bound.toString())
   // (state) => (_filterA,_filterB)

  selector = bound('a','b')
  console.log(selector.toString())

})
