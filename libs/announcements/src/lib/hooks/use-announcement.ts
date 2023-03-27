import { useCallback, useEffect, useState } from 'react';
import type { AppNameType, Announcement } from '../schema';
import { AnnouncementsSchema } from '../schema';

const getData = async (name: AppNameType, url: string) => {
  const now = new Date();
  const response = await fetch(url);
  const data = await response.json();
  const parsed = AnnouncementsSchema.parse(data);

  const list = parsed[name] || [];

  const announcements = list
    .filter((item) => {
      // Don't add expired items
      return !item.timing?.to || (item.timing.to && now < item.timing.to);
    })
    .sort((a, b) => {
      const fromA = a.timing?.from || new Date(0);
      const fromB = b.timing?.from || new Date(0);
      // Sort by from date
      return fromA.valueOf() - fromB.valueOf();
    });

  return announcements[0] || null;
};

type State = {
  loading: boolean;
  data: null | Announcement;
  error: null | string;
};

export const useAnnouncement = (name: AppNameType, url: string) => {
  const [state, setState] = useState<State>({
    loading: true,
    data: null,
    error: null,
  });

  const fetchData = useCallback(() => {
    let mounted = true;

    getData(name, url)
      .then((data) => {
        if (mounted) {
          setState({
            loading: false,
            data,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({
            loading: false,
            data: null,
            error: `${err}`,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [name, url, setState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    reload: fetchData,
  };
};
