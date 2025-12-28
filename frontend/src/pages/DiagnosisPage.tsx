import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { DiagnosisForm } from '../components/diagnosis';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

export const DiagnosisPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Box>
            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
                <Tab label="Manual Entry" />
                <Tab label="Upload Lab Report" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <DiagnosisForm unified={false} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <DiagnosisForm unified={true} />
            </TabPanel>
        </Box>
    );
};

export default DiagnosisPage;
