import React, { useState } from 'react'
import { BaseButton } from '../../../components/Buttons'
import Panel from '../../../components/Panel/Panel'
import ServerConfig from '../../../config/config.server.json'

interface AddEmailInterface {
  verifier: string
}

const AddEmail: React.FC<AddEmailInterface> = ({ verifier }) => {
  const [isError, setIsError] = useState<string | null>(null)

  const [emailAddress, setEmailAddress] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  // to do - find logined a/c etc
  const did = ''
  // const did = !!account ? createDidFormat(account, chainId) : ''
  const mailCode = () => {
    const requestVerification = () => fetch(`${ServerConfig.backUrl}/requestVerification/` + did, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ emailAddress })
    }).then(() => {
      setEmailSent(true)
    }).catch(handleError)
  }

  const handleError = (error: Error) => setError(error ? error.message : 'Unhandled error')

  const verifyCode = () => {
    /*
    setIsLoading(true)
    setIsError(null)

    if (type === '' || content === '') {
      setIsLoading(false)
      return setIsError('Type and Content cannot be empty.')
    }

    addDeclarativeDetail(`DD_${type.toUpperCase()}`, content)
      .then(() => {
        setIsLoading(false)
        setContent('')
        setType('')
      })
      .catch((err: Error) => {
        setIsLoading(false)
        setIsError(err.message)
      })
      */
  }

  const title = <>Add Email</>

  return (
    <Panel title={title} className="add-email">
      <div className="container">
        <div className="column">
          <input type="text"
            className="line type"
            onChange={(evt) => setEmailAddress(evt.target.value)}
            disabled={emailSent}
            placeholder="Email" />
        </div>
        <div className="column submitColumn">
          <BaseButton className="submit turquoise" onClick={mailCode} disabled={emailSent}>Send code</BaseButton>
        </div>
        <div className="column">
          <input type="text"
            className="line type"
            onChange={(evt) => setEmailCode(evt.target.value)}
            disabled={!emailSent}
            placeholder="Enter code" />
        </div>
        <div className="column submitColumn">
          <BaseButton className="submit turquoise" onClick={verifyCode} disabled={!emailSent}>Verify</BaseButton>
        </div>
      </div>
      {isError && (
        <div className="alert error">
          <p>{isError}</p>
        </div>
      )}
    </Panel>
  )
}

export default AddEmail
