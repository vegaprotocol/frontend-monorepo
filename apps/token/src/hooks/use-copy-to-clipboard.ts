import * as React from 'react'

export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false)

  // Once copied flip a boolean so we can display
  // a message to the user such as 'Copied!' which will
  // revert after 800 milliseconds
  React.useEffect(() => {
    let timeout: any
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false)
      }, 800)
    }
    return () => clearTimeout(timeout)
  }, [copied])

  // Create an input we can copy text from and render it
  // off screen
  function handler(text: string) {
    const input = document.createElement('input')
    input.style.position = 'fixed'
    input.style.left = '100vw'
    input.style.opacity = '0'
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    setCopied(true)
  }

  return {
    copy: handler,
    copied
  }
}
