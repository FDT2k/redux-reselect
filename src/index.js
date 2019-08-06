export const bindSelectorsToState=  getState => selectors => {
  //console.log(selectors)

  const boundSelectors = {}

  for(const key in selectors){
    const selector = selectors[key]
    if(typeof selector === 'function'){
      boundSelectors[key] = bindSelectorToState(getState)(selector);
    } else if ( typeof selector === 'object'){
      boundSelectors[key] = bindSelectorsToState(getState)(selector);
    }
  }

  return boundSelectors;
}


export const bindSelectorToState = getState => selector =>{
  return ()=>{
    return selector(getState())
  }
}
