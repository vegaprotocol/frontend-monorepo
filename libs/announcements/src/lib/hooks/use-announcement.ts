import { useCallback, useEffect, useState } from 'react'
import type { AppNameType } from '../schema'
import { AnnouncementsSchema, Announcement } from '../schema'

const getData = async (name: AppNameType, url: string) => {
  const now = new Date()
  const response = await fetch(url)
  const data = await response.json()
  const parsed = AnnouncementsSchema.parse(data)

  const list = parsed[name] || []

  const announcements = list.filter((item) => {
    // Don't add expired items
    return !item.timing || (item.timing.to && now < item.timing.to)
  }).sort((a, b) => {
    const fromA = a.timing?.from || new Date(0)
    const fromB = b.timing?.from || new Date(0)
    // Sort by from date
    return fromA.valueOf() - fromB.valueOf()
  })

  return announcements[0] || null
}

export const useAnnouncement = (name: AppNameType, url: string) => {
  const [data, setData] = useState<null | Announcement>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<null | string>(null)

  const fetchData = useCallback(() => {
    getData(name, url).then((d) => {
      setData(d)
      setLoading(false)
      setError(null)
    }).catch(err => {
      setData(null)
      setLoading(false)
      setError(`${err}`)
    })
  }, [name, url, setLoading, setData, setError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    loading,
    error,
    data,
    reload: fetchData,
  }
}