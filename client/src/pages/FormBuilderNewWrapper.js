import React, { useState } from 'react';
import FormBuilderNew from './FormBuilderNew';
import { Box, Typography, TextField, Button } from '@mui/material';

const FormBuilderNewWrapper = () => {
  const [shareLink, setShareLink] = useState('');

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <FormBuilderNew setShareLink={setShareLink} />
      {shareLink && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Share this form link:
          </Typography>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" sx={{ mt: 1 }} onClick={handleCopyLink}>
            Copy Link
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormBuilderNewWrapper;
