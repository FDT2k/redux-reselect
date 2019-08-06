import '@babel/polyfill'
import {bindSelectorToState,bindSelectorsToState} from '../src/index';


test ('bindSelectorToState',(done)=>{
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

test ('bindSelectorsToState',(done)=>{
  let selectors = {
    a: (state)=> state,
    b: {
      c:(state)=>{console.log('c');return state},
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
