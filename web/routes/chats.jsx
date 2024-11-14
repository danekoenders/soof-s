import React, { useState, useCallback, useEffect } from 'react';
import { useFindMany } from '@gadgetinc/react';
import { api } from '../api';
import {
  Page,
  Card,
  IndexTable,
  Layout,
  Pagination,
  Banner,
  EmptyState,
  Filters,
  BlockStack,
} from '@shopify/polaris';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import ChatDetail from '../components/chats/ChatDetail';
import { useParams, useNavigate } from 'react-router-dom';
import NoticeHeader from '../components/shared/NoticeHeader';
import { useTranslation } from 'react-i18next';

const ChatsLayout = () => {
  const { t } = useTranslation();

  const NUM_ON_PAGE = 25;
  const [cursor, setCursor] = useState({ first: NUM_ON_PAGE });
  const [query, setQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('descending');
  const [sortColumn, setSortColumn] = useState('createdAt');
  const { chatRef } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (chatRef) {
      shopify.modal.show('chat-detail-modal');
      console.log('chatRef:', chatRef);
    } else {
      shopify.modal.hide('chat-detail-modal');
    }
  }, [chatRef]);

  const [{ data, fetching, error }] = useFindMany(api.chatSession, {
    select: {
      email: true,
      createdAt: true,
      ref: true,
    },
    sort: {
      [sortColumn]: sortDirection === 'ascending' ? 'Ascending' : 'Descending',
    },
    ...cursor,
    live: true,
    search: query,
  });

  const chatItems =
    data?.map((chat) => ({
      id: chat.ref,
      email: chat.email,
      createdAt: new Date(chat.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      ref: chat.ref,
    })) || [];

  const rowMarkup = chatItems.map(({ id, ref, email, createdAt }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      position={index}
      onClick={() => navigate(`/chats/${ref}`)}
    >
      <IndexTable.Cell>{ref}</IndexTable.Cell>
      <IndexTable.Cell>{email}</IndexTable.Cell>
      <IndexTable.Cell>{createdAt}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  const handleNextPage = () => {
    setCursor({
      first: NUM_ON_PAGE,
      after: data?.pagination?.pageInfo?.endCursor,
    });
  };

  const handlePreviousPage = () => {
    setCursor({
      last: NUM_ON_PAGE,
      before: data?.pagination?.pageInfo?.startCursor,
    });
  };

  const handleSort = useCallback(
    (columnIndex) => {
      const columnKey = ['ref', 'email', 'createdAt'][columnIndex];
      const newSortDirection =
        sortDirection === 'ascending' ? 'descending' : 'ascending';
      setSortDirection(newSortDirection);
      setSortColumn(columnKey);
    },
    [sortDirection]
  );

  const handleQueryChange = (value) => setQuery(value);
  const handleQueryClear = () => setQuery('');

  const handleModalClose = () => {
    navigate('/chats');
  };

  if (error) {
    return (
      <Page title={t('routes.chats.pageTitle')}>
        <Banner tone="critical">
          {t('Error')}: {error.message}
        </Banner>
      </Page>
    );
  }

  return (
    <Page title={t('routes.chats.pageTitle')}>
      <Layout>
        <NoticeHeader />
        <Layout.Section>
          <BlockStack gap={200}>
            <Card>
              <Filters
                queryValue={query}
                filters={[]}
                onQueryChange={handleQueryChange}
                onQueryClear={handleQueryClear}
                queryPlaceholder={t(
                  'routes.chats.searchPlaceholder'
                )}
              />
              <IndexTable
                resourceName={{
                  singular: t('routes.chats.resourceName.singular'),
                  plural: t('routes.chats.resourceName.plural'),
                }}
                itemCount={chatItems.length}
                headings={[
                  { title: t('routes.chats.headings.ref'), sortable: true },
                  { title: t('routes.chats.headings.email'), sortable: true },
                  { title: t('routes.chats.headings.createdAt'), sortable: true },
                ]}
                onSort={(columnIndex) => handleSort(columnIndex)}
                sortDirection={sortDirection}
                sortColumnIndex={['ref', 'email', 'createdAt'].indexOf(sortColumn)}
                selectable={false}
                loading={fetching}
                emptyState={
                  <EmptyState
                    heading={t('routes.chats.emptyState.heading')}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>{t('routes.chats.emptyState.description')}</p>
                  </EmptyState>
                }
              >
                {rowMarkup}
              </IndexTable>
            </Card>
            <Pagination
              hasPrevious={data?.pagination?.pageInfo?.hasPreviousPage}
              onPrevious={handlePreviousPage}
              hasNext={data?.pagination?.pageInfo?.hasNextPage}
              onNext={handleNextPage}
            />
          </BlockStack>
        </Layout.Section>
      </Layout>
      <Modal id="chat-detail-modal" onHide={handleModalClose} open={!!chatRef}>
        <TitleBar title={t('routes.chats.modalTitle')} />
        <ChatDetail chatRef={chatRef} />
      </Modal>
    </Page>
  );
};

export default ChatsLayout;