import React, { useEffect, useState } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type })
    if (duration) {
      setTimeout(() => setToast(null), duration)
    }
  }

  return { toast, showToast, setToast }
}

const Toast = (props) => {
  const { message, type = 'success', onClose } = props

  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-green-500'

  const icon = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }[type] || 'fa-check-circle'

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-pulse`}>
      <i className={`fas ${icon}`}></i>
      <span>{message}</span>
    </div>
  )
}

export default Toast
