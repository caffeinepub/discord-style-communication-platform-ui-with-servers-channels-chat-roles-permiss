/**
 * Utility to hide a specific element identified by XPath.
 * Targets only /html[1]/body[1]/div[5]/button[1] and removes it from the DOM.
 */
export function hideElementByXPath(xpath: string): boolean {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    const node = result.singleNodeValue;
    
    // Only act if it's exactly a button element at the specified path
    if (node && node instanceof HTMLButtonElement) {
      node.remove();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error evaluating XPath:', error);
    return false;
  }
}

/**
 * Sets up a MutationObserver to continuously monitor and remove the target element.
 * Returns a cleanup function to disconnect the observer.
 */
export function setupXPathElementRemoval(xpath: string): () => void {
  // Initial removal attempt
  hideElementByXPath(xpath);
  
  // Set up observer to catch dynamic insertions
  const observer = new MutationObserver(() => {
    hideElementByXPath(xpath);
  });
  
  // Observe the entire document for additions
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // Return cleanup function
  return () => observer.disconnect();
}
