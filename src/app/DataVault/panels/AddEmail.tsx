import React, { useState } from 'react'
import { BaseButton } from '../../../components/Buttons'
import Panel from '../../../components/Panel/Panel'
import ServerConfig from '../../../config/config.server.json'
import { createDidFormat, truncateAddressDid } from '../../../formatters'
import { WebServiceInterface } from '../../../interfaces/webservice.interface'

interface AddEmailInterface {
  address: string
  chainId: number
}
interface ResponseMessage {
  message: string
}

const AddEmail: React.FC<AddEmailInterface> = ({ address, chainId }) => {
  const [isError, setIsError] = useState<string | null>(null)

  const [emailAddress, setEmailAddress] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [headerStatus, setHeaderStatus] = useState(0)
  const did = createDidFormat(address, chainId)

  const [result, setResult] = useState<WebServiceInterface<ResponseMessage>>({ status: 'init' })

  const mailCode = () => {
    setResult({ status: 'loading' })
    fetch(`${ServerConfig.backUrl}/issuer/mailCode/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ emailAddress, did })
    }).then(response => {
      console.log('response.status=', response.status)

      if (!response.ok) {
        response.json().then((jsonData) => {
          console.log('jsonData=', jsonData)
          setResult({ status: 'loaded', payload: jsonData })
          if (result.status === 'loaded') throw new Error(result.payload.message)
        })
      } /* else if (!response.ok) {
        throw new Error('HTTP status ' + response.status)
      } */
    })
      .catch(handleError)
  }

  const handleError = (error: Error) => {
    console.log('error in call')
    setError(error ? error.message : 'Unhandled error')
  }

  const verifyCode = () => {
    // to do
  }

  const title = <>Add Email | did={did}</>

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
      {error && (
        <div className="alert error">
          <p>{error}</p>
        </div>
      )}
      | status = {result.status} | {result.status === 'loaded' && result.payload}
    </Panel>
  )
}

export default AddEmail
