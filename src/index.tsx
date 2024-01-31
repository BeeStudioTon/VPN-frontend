/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

import { App } from './App'

import './index.scss'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const el = document.createElement('div')
document.body.appendChild(el)

root.render(
    <TonConnectUIProvider manifestUrl="https://gist.github.com/anovic123/2ef0598e36883fa1ce7ef61b66b868de.txt">
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </TonConnectUIProvider>
)
