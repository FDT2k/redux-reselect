import '@babel/polyfill'

import {combineSelectors,key,group,expandCreator,asSelector,asCreator} from '../src/index';

import {createSelector} from 'reselect'


test ('bindSelectorToState',()=>{


  let _selector = (state)=>{
    return state;
  }



  let _creator = (filter,filter2)=>{
    return createSelector(
      _selector,
      state => ({filter,filter2,state:state})
    )

  }

  let getState = ()=>{
    return {
      "hello": "world"
    }
  }



  let expectedSelector = {
       "hello": "world",
     }

  let expectedCreator = {

       "filter": "a",
       "filter2": "b",
       "state":  {
          "hello": "world",
       },

  }

  let combined = combineSelectors(
    asSelector('mySelector',_selector),
    asCreator('myCreator',_creator),
    group ('myGroup')(
      asCreator('myCreator',_creator),
      asSelector('mySelector',_selector),
      asSelector('mySelector2',_selector),
      asSelector('mySelector3',_selector),

      expandCreator(['AB','AC'],asCreator,_creator,'myExpandedCreatorWith')
    )
  )

  let selectors = combined(getState)

  expect(selectors.mySelector()).toEqual(expectedSelector)

  expect(selectors.myCreator('a','b')()).toEqual(expectedCreator)

//  console.log(combined().myCreator(getState)('A','B')())
})
