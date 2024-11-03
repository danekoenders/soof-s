import React, { useEffect } from 'react';
import { useFindBy } from '@gadgetinc/react';
import { api } from '../../api';
import {
    Text,
    Spinner,
    Banner,
    Scrollable,
    BlockStack,
    InlineStack,
    Box,
    Tooltip,
} from '@shopify/polaris';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from '../utils/CopyToClipboard';

const ChatDetail = ({ chatRef }) => {
    const [{ data, fetching, error }, fetchChat] = useFindBy(
        api.chatSession.findByRef,
        chatRef,
        {
            select: {
                email: true,
                ref: true,
                transcript: true,
            },
            live: true,
        }
    );

    useEffect(() => {
        fetchChat();
    }, [chatRef, fetchChat]);

    if (fetching) {
        return (
            <Spinner accessibilityLabel="Loading chat details" size="large" />
        );
    }

    if (error) {
        return <Banner tone="critical">Error: {error.message}</Banner>;
    }

    let parsedTranscript = [];
    if (typeof data?.transcript === 'string') {
        try {
            parsedTranscript = JSON.parse(data.transcript);
        } catch (e) {
            console.error('Failed to parse transcript:', e);
        }
    } else if (Array.isArray(data?.transcript)) {
        parsedTranscript = data.transcript;
    }

    return (
        <Box padding='400'>
            <InlineStack align='space-between'>
                <Text variant='headingMd'>
                    Ref:{' '}
                    <CopyToClipboard
                        input={data.ref}
                        innerText={data.ref}
                    />
                </Text>
                <Text variant='headingMd'>
                    Email:{' '}
                    <CopyToClipboard
                        input={data.email}
                        innerText={data.email}
                        textTransform="lowercase"
                    />
                </Text>
            </InlineStack>
            <Scrollable shadow="above" style={{ height: '500px', marginTop: '1rem' }}>
                <BlockStack spacing="tight">
                    {parsedTranscript?.length > 0 ? (
                        parsedTranscript.map((entry, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        entry.role === 'user' ? 'flex-start' : 'flex-end',
                                    marginBottom: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        backgroundColor:
                                            entry.role === 'user' ? '#f4f6f8' : '#dfe3e8',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <ReactMarkdown>
                                        {typeof entry.message === 'object'
                                            ? entry.message.reply
                                            : entry.message}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Text>No transcript available</Text>
                    )}
                </BlockStack>
            </Scrollable>
        </Box>
    );
};

export default ChatDetail;