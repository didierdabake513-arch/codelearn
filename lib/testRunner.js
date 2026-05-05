/**
 * Client-side test runner.
 * Injects user code into a sandboxed iframe and evaluates tests against the DOM.
 *
 * Test types:
 *  hasTag        — document contains at least one <tag>
 *  tagContainsText — element.textContent includes text
 *  hasAttr       — element has attribute
 *  minCount      — at least N elements of tag exist
 *  cssContains   — <style> block contains string
 *  codeContains  — raw source code contains string
 *  consoleLog    — console.log was called with matching text
 */

export function runTests(userCode, tests) {
  return new Promise((resolve) => {
    const results = []
    const trimmedCode = (userCode || '').trim()

    // Create hidden iframe
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;'
    iframe.sandbox = 'allow-scripts'
    document.body.appendChild(iframe)

    // Capture console.log calls
    const consoleLogs = []
    const wrappedCode = userCode.replace(
      /<\/head>/i,
      `<script>
        window.__consoleLogs = [];
        console.log = function(...args) {
          window.__consoleLogs.push(args.map(String).join(' '));
        };
      <\/script></head>`
    )

    const isHtmlDoc = /<html|<!doctype/i.test(trimmedCode)
    const looksLikeHtmlSnippet = /<\/?[a-z][\s\S]*>/i.test(trimmedCode)
    const htmlSnippetDoc = `<!DOCTYPE html><html><head><script>
      window.__consoleLogs = [];
      console.log = function(...args) {
        window.__consoleLogs.push(args.map(String).join(' '));
      };
    <\/script></head><body>${userCode}</body></html>`
    const jsDoc = `<!DOCTYPE html><html><head><script>
      window.__consoleLogs = [];
      console.log = function(...args) {
        window.__consoleLogs.push(args.map(String).join(' '));
      };
    <\/script></head><body><script>${userCode}<\/script></body></html>`
    const fullCode = isHtmlDoc ? wrappedCode : (looksLikeHtmlSnippet ? htmlSnippetDoc : jsDoc)

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument
        const logs = iframe.contentWindow?.__consoleLogs || []

        for (const test of tests) {
          let passed = false
          try {
            switch (test.check) {
              case 'hasTag': {
                passed = doc.querySelectorAll(test.arg).length > 0
                break
              }
              case 'tagContainsText': {
                const els = doc.querySelectorAll(test.arg)
                passed = Array.from(els).some(el =>
                  el.textContent.toLowerCase().includes((test.text || '').toLowerCase())
                )
                break
              }
              case 'hasAttr': {
                const els = doc.querySelectorAll(test.tag)
                passed = Array.from(els).some(el => el.hasAttribute(test.attr))
                break
              }
              case 'minCount': {
                passed = doc.querySelectorAll(test.tag).length >= (test.min || 1)
                break
              }
              case 'cssContains': {
                const styles = Array.from(doc.querySelectorAll('style'))
                  .map(s => s.textContent).join('\n')
                passed = styles.includes(test.text)
                break
              }
              case 'codeContains': {
                passed = userCode.includes(test.text)
                break
              }
              case 'consoleLog': {
                passed = logs.some(l => l.toLowerCase().includes((test.text || '').toLowerCase()))
                break
              }
              default:
                passed = false
            }
          } catch { passed = false }

          results.push({ id: test.id, description: test.description, passed })
        }
      } catch (e) {
        tests.forEach(t => results.push({ id: t.id, description: t.description, passed: false, error: e.message }))
      }

      document.body.removeChild(iframe)
      resolve(results)
    }

    iframe.srcdoc = fullCode
  })
}

export function allPassed(results) {
  return results.length > 0 && results.every(r => r.passed)
}
