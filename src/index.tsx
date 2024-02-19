/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// import { TonConnectUIProvider } from '@tonconnect/ui-react'
// import eruda from 'eruda'
import { TonConnectProvider } from './logic/tonConnectProvider'
import { App } from './App'

import './index.scss'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// const el = document.createElement('div')
// document.body.appendChild(el)

// eruda.init({
//     container: el,
//     tool: [ 'console', 'elements' ]
// })

root.render(

    <BrowserRouter>
        <TonConnectProvider>
            <App />
        </TonConnectProvider>
    </BrowserRouter>
)
