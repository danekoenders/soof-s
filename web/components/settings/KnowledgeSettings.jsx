import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, FormLayout, TextField, Button, Banner } from '@shopify/polaris';
import { useAction, useFindBy } from '@gadgetinc/react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';

const requiredKnowledge = ['FAQ', 'ReturnPolicy', 'ShippingInfo']; // Replace with actual field names

export default function KnowledgeSettings() {
  const { shopId } = useShop();
  const navigate = useNavigate();

  const [{ data: knowledgeData, error: knowledgeError, fetching: knowledgeFetching }, fetchKnowledge] =
    useFindBy(api.knowledge.findByShop, shopId);

  const [{ data: updateData, error: updateError, fetching: updateFetching }, updateKnowledge] = useAction(
    api.knowledge.update
  );

  const [knowledgeFields, setKnowledgeFields] = useState({});

  const initialDataRef = useRef(null);

  useEffect(() => {
    fetchKnowledge();
  }, [shopId]);

  useEffect(() => {
    if (knowledgeData) {
      setKnowledgeFields(knowledgeData || {});
      if (!initialDataRef.current) {
        initialDataRef.current = knowledgeData || {};
      }
    }
  }, [knowledgeData]);

  useEffect(() => {
    if (updateData) {
      navigate(
        `/dashboard/${shopId}/assistants?toast=Knowledge updated successfully!&severity=success`
      );
    }
  }, [updateData]);

  const handleSubmit = async () => {
    await updateKnowledge({
      id: knowledgeData.id,
      ...knowledgeFields,
    });
  };

  const isFormChanged = () => {
    if (!initialDataRef.current) {
      return false;
    }
    return JSON.stringify(knowledgeFields) !== JSON.stringify(initialDataRef.current);
  };

  if (knowledgeFetching) {
    return <div>Loading...</div>;
  }

  if (knowledgeError) {
    return <Banner status="critical">Error: {knowledgeError.message}</Banner>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Card sectioned>
        <FormLayout>
          {requiredKnowledge.map((field) => (
            <TextField
              key={field}
              label={field}
              value={knowledgeFields[field] || ''}
              onChange={(value) => setKnowledgeFields({ ...knowledgeFields, [field]: value })}
              requiredIndicator
              multiline
            />
          ))}
          <Button submit primary disabled={!isFormChanged() || updateFetching} loading={updateFetching}>
            Update Knowledge
          </Button>
          {updateError && <Banner status="critical">{updateError.message}</Banner>}
        </FormLayout>
      </Card>
    </Form>
  );
}
