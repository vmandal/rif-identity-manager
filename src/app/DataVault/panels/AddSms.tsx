import React, { useState, useContext } from 'react'
import { BaseButton } from '../../../components/Buttons'
import Panel from '../../../components/Panel/Panel'
import ServerConfig from '../../../config/config.server.json'
import { createDidFormat } from '../../../formatters'
import { Web3ProviderContext } from '../../../providerContext'
import DataVaultWebClient, { AuthManager, AsymmetricEncryptionManager, SignerEncryptionManager } from '@rsksmart/ipfs-cpinner-client'

interface AddSMSInterface {
  address: string
  chainId: number
}

const AddSms: React.FC<AddSMSInterface> = ({ address, chainId }) => {
  const [message, setMessage] = useState('')
  const [mobile, setMobile] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [error, setError] = useState('')
  const [jwt, setJwt] = useState('')
  const did = createDidFormat(address, chainId)
  const context = useContext(Web3ProviderContext)

  const sendSms = () => {
    setError(''); setMessage('')

    let headerStatus = 0
    fetch(`${ServerConfig.issuerServerUrl}/issuer/smsCode/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ mobile, did })
    }).then(response => {
      headerStatus = response.status
      return response
    }).then(response => response.json())
      .then(responseJson => {
        if (headerStatus !== 200) {
          throw new Error(responseJson.message)
        } else {
          setMessage(responseJson.message)
          setSmsSent(true)
        }
      })
      .catch(handleError)
  }

  const handleError = (error: Error) => {
    setError(error ? error.message : 'Unhandled error')
  }

  const verifyCode = () => {
    setError('')
    setMessage('')

    const msg = `code:${smsCode}`
    context.provider.request({
      method: 'personal_sign',
      params: [msg, address]
    }).then((sig: string) => { issuerAddMobile(msg, sig) })
      .catch((error: any) => { setError(error.message) })
  }

  const issuerAddMobile = (msg: string, sig: string) => {
    setError(''); setMessage('')

    let headerStatus = 0
    fetch(`${ServerConfig.issuerServerUrl}/issuer/AddMobile/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ did, msg, sig })
    }).then(response => {
      headerStatus = response.status
      return response
    }).then(response => response.json())
      .then(responseJson => {
        console.log('responseJson=', responseJson)
        if (headerStatus !== 200) {
          throw new Error(responseJson.message)
        } else {
          setMessage(responseJson.message)
          setJwt(responseJson.jwt)
        }
      })
      .catch(handleError)
  }

  const serviceUrl = ServerConfig.dataVaultUrl

  const getEncryptionManager = async (provider: any) => {
    if (provider.isMetaMask && !provider.isNiftyWallet) return await AsymmetricEncryptionManager.fromWeb3Provider(provider)
    return await SignerEncryptionManager.fromWeb3Provider(provider)
  }

  const saveInDataVault = () => {
    setError(''); setMessage(''); setMobile(''); setSmsCode('')

    getEncryptionManager(context.provider).then((encryptionManager) => new DataVaultWebClient({
      authManager: new AuthManager({
        did,
        serviceUrl,
        personalSign: (data: string) => context.provider!.request({ method: 'personal_sign', params: [data, address] })
      }),
      encryptionManager,
      serviceUrl
    }).create({ key: 'SmsVerifiableCredential', content: jwt })
      .then((response) => {
        console.log(response)
        setMessage('SMS Verifiable Credential saved')
        setSmsCode('')
        setJwt('')
      })
    ).catch(handleError)
  }

  const title = <>Add SMS Credential</>

  return (
    <Panel title={title} className="add-mobile">
      <div className="container">
        <div className="column">
          <input type="text"
            className="line type"
            onChange={(evt) => setMobile(evt.target.value)}
            disabled={smsSent}
            placeholder="Mobile number" />
        </div>
        <div className="column submitColumn">
          <BaseButton className="submit turquoise" onClick={sendSms} disabled={smsSent}>Send code</BaseButton>
        </div>
        <div className="column">
          <input type="text"
            className="line type"
            onChange={(evt) => { setSmsCode(evt.target.value); setJwt('') }}
            disabled={!smsSent}
            placeholder="Enter code" />
        </div>
        <div className="column submitColumn">
          <BaseButton className="submit turquoise" onClick={verifyCode} disabled={!smsSent || (jwt !== '') }>Verify</BaseButton>
        </div>
        <div className="column submitColumn">
          <BaseButton className="submit turquoise" onClick={saveInDataVault} disabled={!jwt}>Save</BaseButton>
        </div>
      </div>
      {error && (
        <div className="alert error">
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="alert info">
          <p>{message}</p>
        </div>
      )}
    </Panel>
  )
}

export default AddSms
