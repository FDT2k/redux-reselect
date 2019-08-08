import {compose,curry} from '@geekagency/composite-js'

export const bindSelectorsToState = getState => selectors => {

  if(typeof selectors !== 'object'){
    throw new Error('bindSelectorsToState require an object')
  }

  const boundSelectors = {}
  const bindSelector = bindSelectorToState(getState)
  const bindSelectors = bindSelectorsToState(getState)

  for(const key in selectors){
    const selector = selectors[key]
    if(typeof selector === 'function'){
      boundSelectors[key] = bindSelector(selector);
    } else if ( typeof selector === 'object'){
      boundSelectors[key] = bindSelectors(selector);
    }
  }

  return boundSelectors;
}

// selector :: Object-> Object == identity
// selectorCreator:: (a,b,...z) -> a-> b -> ... -> z -> selector
// callee :: x => x()
// bindSelectorToState :: callee -> selector -> selector
export const bindSelectorToState = curry((getState,selector)=>{
  return (state)=>{ // still can pass another state
    state = state || getState()
    return selector(state)
  }
})


/*
Create a selectorCreator that allow to be bound to state

// selectorCreator:: (a,b,...z) -> a-> b -> ... -> z -> Object-> Object

makeBindableSelectorCreator:: selectorCreator -> Object -> (a,...,z) -> selectorCreator
*/
export const makeBindableSelectorCreator=(selectorCreator)=>state=>(...args)=>()=>{
    // here we just get the state, that will be already called by bindSelectorToState
  return selectorCreator(...args)(state)
}
