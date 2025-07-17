import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

const textContent = {
    quickLinksFooter: {
        statusPage: 'StatusPage.io',
        sentry: 'Sentry',
        slack: 'Slack',
        footerText: 'Dashboard · All data from integrated services · Last check: a few seconds ago'
    }
};

export default function QuickLinksFooter() {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pb={4}>
            <Box display="flex" gap={1}>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.statusPage}</Button>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.sentry}</Button>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.slack}</Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {textContent.quickLinksFooter.footerText}
            </Typography>
        </Box>
    );
}