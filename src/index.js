import {compose,curry,curryN} from '@geekagency/composite-js'



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

//
export const bindCreatorToState = curry ( (getState,selectorCreator)=>{
 return curryN(selectorCreator,(...args)=>{
   return (state)=>{
     state = state || getState()
     return selectorCreator(...args)(state)
   }
 })
})



//recursively bind object properties
export const bindPropertiesToArg = fnToBind => argToBind => object => {
  if(typeof object !== 'object'){
    throw new Error('bindPropertiesToArg require an object')
  }
  const bound = {}

  for(const key in object){
    const fn = object[key]
    if(typeof fn === 'function'){
      bound[key] =  fnToBind(argToBind)(fn);
    } else if ( typeof fn === 'object'){
      bound[key] = bindPropertiesToArg(fnToBind)(argToBind)(fn);
    } else {
      throw new Error ('bindPropertiesToArg requires a function or object as value of key ', key)
    }
  }
  return bound;
}

export const bindSelectorsToState = bindPropertiesToArg(bindSelectorToState)

export const bindCreatorsToState = bindPropertiesToArg(bindCreatorToState)
