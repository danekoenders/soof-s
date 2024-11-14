import React, { useCallback } from 'react';
import { Button } from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';
import { useTranslation } from 'react-i18next';

const CopyToClipboard = ({ input, innerText, textTransform }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(input.toString());
    shopify.toast.show(t('components.utils.CopyToClipboard.copied'));
  }, [input]);

  return (
    <Button
      onClick={handleClick}
      size='slim'
      variant='monochromePlain'
    >
      {innerText || <ClipboardIcon />}
    </Button>
  );
};

export default CopyToClipboard;
