import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const response = await api.get('/notifications');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read');
      await load();
    } catch (error) {
      console.error(
        'Failed to mark notifications as read:',
        error
      );
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  const filteredItems = useMemo(() => {
    if (filter === 'unread') {
      return items.filter((n) => !n.read);
    }

    if (filter === 'read') {
      return items.filter((n) => n.read);
    }

    return items;
  }, [items, filter]);

  const getNotificationIcon = (notification) => {
    const text = `${notification.title || ''} ${
      notification.message || ''
    }`.toLowerCase();

    if (
      text.includes('doubt') ||
      text.includes('answer') ||
      text.includes('question')
    ) {
      return '💡';
    }

    if (
      text.includes('mentor') ||
      text.includes('mentorship')
    ) {
      return '🎓';
    }

    if (
      text.includes('resource') ||
      text.includes('note') ||
      text.includes('study')
    ) {
      return '📚';
    }

    if (
      text.includes('placement') ||
      text.includes('job') ||
      text.includes('company')
    ) {
      return '💼';
    }

    if (
      text.includes('internship') ||
      text.includes('intern')
    ) {
      return '🚀';
    }

    if (
      text.includes('chat') ||
      text.includes('message')
    ) {
      return '💬';
    }

    if (
      text.includes('connect') ||
      text.includes('follow')
    ) {
      return '🤝';
    }

    return '✦';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor(
      (now - created) / 1000
    );

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };

  return (
    <div className="notificationsPage">

      {/* HERO */}
      <div className="notificationHero">

        <div>
          <span className="eyebrow">
            COMMUNITY UPDATES
          </span>

          <h1>Stay connected with your community.</h1>

          <p>
            Keep track of new answers, messages, mentorship
            activity, resources and important updates across
            Cognita Nexus.
          </p>
        </div>

        <div className="notificationHeroCard">

          <div className="notificationBell">
            🔔
          </div>

          <div>
            <strong>
              {unreadCount
                ? `${unreadCount} unread update${
                    unreadCount > 1 ? 's' : ''
                  }`
                : 'All caught up'}
            </strong>

            <span>
              {unreadCount
                ? 'Check what is new'
                : 'Nothing needs your attention'}
            </span>
          </div>

        </div>
      </div>


      {/* STATS */}
      <div className="notificationStats">

        <div className="notificationStat">
          <div className="statIcon purple">🔔</div>

          <div>
            <span>Total Notifications</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="notificationStat">
          <div className="statIcon orange">●</div>

          <div>
            <span>Unread Updates</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="notificationStat">
          <div className="statIcon green">✓</div>

          <div>
            <span>Read Updates</span>
            <strong>
              {items.length - unreadCount}
            </strong>
          </div>
        </div>

      </div>


      {/* TOOLBAR */}
      <div className="notificationToolbar">

        <div className="notificationFilters">

          <button
            className={
              filter === 'all'
                ? 'notificationFilter active'
                : 'notificationFilter'
            }
            onClick={() => setFilter('all')}
          >
            All
            <span>{items.length}</span>
          </button>

          <button
            className={
              filter === 'unread'
                ? 'notificationFilter active'
                : 'notificationFilter'
            }
            onClick={() => setFilter('unread')}
          >
            Unread
            <span>{unreadCount}</span>
          </button>

          <button
            className={
              filter === 'read'
                ? 'notificationFilter active'
                : 'notificationFilter'
            }
            onClick={() => setFilter('read')}
          >
            Read
            <span>{items.length - unreadCount}</span>
          </button>

        </div>

        {unreadCount > 0 && (
          <button
            className="outlineBtn"
            onClick={markAllAsRead}
          >
            ✓ Mark all as read
          </button>
        )}

      </div>


      {/* NOTIFICATIONS */}
      <div className="notificationContent">

        {filteredItems.length > 0 ? (
          <div className="notificationList">

            {filteredItems.map((n) => (
              <div
                className={
                  n.read
                    ? 'notificationItem'
                    : 'notificationItem unread'
                }
                key={n._id}
              >

                <div className="notificationIcon">
                  {getNotificationIcon(n)}
                </div>

                <div className="notificationBody">

                  <div className="notificationTop">

                    <div>
                      <b>{n.title}</b>

                      {!n.read && (
                        <span className="newBadge">
                          NEW
                        </span>
                      )}
                    </div>

                    <time>
                      {getTimeAgo(n.createdAt)}
                    </time>

                  </div>

                  <p>{n.message}</p>

                  <span className="notificationDate">
                    {new Date(
                      n.createdAt
                    ).toLocaleString()}
                  </span>

                </div>

                {!n.read && (
                  <div className="unreadIndicator"></div>
                )}

              </div>
            ))}

          </div>
        ) : (
          <div className="notificationEmpty">

            <div className="notificationEmptyIcon">
              {filter === 'unread' ? '✓' : '🔔'}
            </div>

            <h2>
              {filter === 'unread'
                ? 'You are all caught up!'
                : filter === 'read'
                ? 'No read notifications'
                : 'No notifications yet'}
            </h2>

            <p>
              {filter === 'unread'
                ? 'There are no unread updates waiting for you.'
                : 'Community activity and important updates will appear here.'}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}