import {compose,curry,curryN,flip,supertrace} from '@geekagency/composite-js'


export const _bindSelectorToState = (getState,selector)=>{
  return (state)=>{ // still can pass another state
    state = state || getState()
    return selector(state)
  }
}



export const _bindCreatorToState = (getState,selectorCreator)=>{
 return curryN(selectorCreator,(...args)=>{
   return (state)=>{
  //   console.log('state',state,getState)
     state = state || getState()
     return selectorCreator(...args)(state)
   }
 })
}


// selector :: Object-> Object == identity
// selectorCreator:: (a,b,...z) -> a-> b -> ... -> z -> selector
// callee :: x => x()
// bindSelectorToState :: callee -> selector -> selector
export const bindSelectorToState = curry(_bindSelectorToState)
export const bindCreatorToState = curry(_bindCreatorToState)




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



export const defaultSelectorClassifier = isSelector => { console.log('default classifier'); return isSelector}

export const binder = combinedSelectors => getState=>{
  let result = {}
  for(const key in combinedSelectors){
    const fn = combinedSelectors[key];
    if(typeof fn ==='function'){
      result[key]=fn(getState);
    }else if(typeof fn ==='object'){
      result[key]= binder(fn)(getState);
    }else{
      throw new Error('binder require a property as function or object')
    }

  }
  return combinedSelectors
}

export const combineSelectors  = (...args) => getState => {
  args = [].concat.apply([], args);
	return args.reduce((selectors, selector) => {
		let val = selector(getState)
		return {...selectors, ...val};
	},{});

}

export const group = group => (...args)=> (classifier= defaultSelectorClassifier)=>{
	args = [].concat.apply([], args);
	return {[group]:combineSelectors(...args)(classifier)};
}

/*
expand a creator to many subcreators or selectors

for example if you have a creator with two args
you can use expand to bind the first arg and create two new creators (or selectors)

*/

let defaultNameExpander = curry((arg,key,name)=>{
  return `${name}${key}`
})

export const _expandCreator = curry ((namer, args,bindAs,_creator,name) =>{

	return args.map((arg,key)=>{
    let _name = namer(arg,key,name);
		return bindAs(_name,_creator(arg))
	});
});

export const expandCreator = _expandCreator(defaultNameExpander);

export const key = curry((name,selector)=>{
  if(name){
    return {[name]: selector}
  }else{
    return selector;
  }
})

export const classifier = curry((fnToBind,name,fn,getState)=>{
  return key(name)(fnToBind(fn,getState))
})

export const asCreator = curry((name,fn) =>{
  const bind = flip(_bindCreatorToState);

  return (getState)=>classifier(bind)(name)(fn)(getState)
})


export const asSelector = curry((name,fn) =>{
  const bind = flip(_bindSelectorToState);

  return (getState)=>classifier(bind)(name)(fn)(getState)
})
