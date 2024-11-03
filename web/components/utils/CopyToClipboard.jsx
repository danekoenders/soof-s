import React, { useCallback } from 'react';
import { Button } from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';

const CopyToClipboard = ({ input, innerText, textTransform }) => {
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(input.toString());
    shopify.toast.show('Copied to clipboard!');
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
