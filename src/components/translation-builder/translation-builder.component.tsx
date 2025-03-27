import React, { useEffect, useState } from 'react';
import {
  TranslationProvider,
  useQuestionTranslation,
  languages,
} from '../interactive-builder/modals/manage-question-translation/question-translation-context';
import { type Schema } from '@types';
import {
  TextInput,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Dropdown,
  InlineNotification,
  FileUploader,
  Accordion,
  AccordionItem,
} from '@carbon/react';
import styles from './translation-builder.module.scss';
import type { Translation } from '../interactive-builder/modals/manage-question-translation/question-translation-context';
import { extractUniqueLabelsFromSchema } from './extractUniqueLabelsFromSchema';
interface TranslationBuilderProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

const TranslationBuilderContent: React.FC<TranslationBuilderProps> = ({ schema, onSchemaChange }) => {
  const { translations, getLanguages, addOrUpdateTranslation, getTranslation } = useQuestionTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Record<string, string>>(null);
  const [labels, setLabels] = useState(extractUniqueLabelsFromSchema(schema));
  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>({});
  const [availableLanguagesTranslations, setAvailableLanguagesTranslations] = useState<string[]>(null);
  const [tableRows, setTableRows] = useState<
    Array<{
      id: string;
      originalLabel: string;
    }>
  >([]);

  useEffect(() => {
    setLabels(extractUniqueLabelsFromSchema(schema));
  }, [schema]);
  useEffect(() => {
    if (selectedLanguage && labels.length > 0) {
      const newRows = labels.map((label, index) => ({
        id: `row-${index}`,
        originalLabel: label,
      }));
      setTableRows(newRows);
    }
  }, [labels, selectedLanguage]);

  const headers = [
    { key: 'originalLabel', header: 'Original Label' },
    { key: 'translation', header: `Translation in ${selectedLanguage?.language}` },
  ];
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.selectedItem;
    setSelectedLanguage(selectedLanguage || null);
  };
  const handleTranslationChange = (label: string, translation: string) => {
    if (!selectedLanguage) return;
    addOrUpdateTranslation(selectedLanguage.code, label, translation);
  };

  const downloadTranslation = (translationData) => {
    if (!translations || translations.length === 0) {
      alert('No translations available');
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(translationData, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `translations_${translationData.language}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading translation:', error);
      alert('Failed to download translation');
    }
  };

  return (
    <div className={styles.builder}>
      {!translations && <InlineNotification kind="warning" title="No Available Translations For this form" />}

      <Accordion>
        {translations && (
          <AccordionItem title="Available Translations">
            {translations.map((translation) => {
              const languageName =
                Object.keys(languages).find((key) => languages[key] === translation.language) || translation.language;
              return (
                <Button key={translation.language} onClick={() => downloadTranslation(translation)}>
                  Download Translation for {languageName}
                </Button>
              );
            })}
          </AccordionItem>
        )}
        <AccordionItem title="Upload Translation">
          <FileUploader
            accept={['.json']}
            buttonKind="primary"
            buttonLabel="Add translation Json file"
            filenameStatus="edit"
            iconDescription="Delete file"
            labelDescription="Only .json files are supported."
            labelTitle="Upload Translation file"
            multiple={false}
            name=""
            onChange={() => {}}
            onClick={() => {}}
            onDelete={() => {}}
            size="md"
          />
        </AccordionItem>

        <AccordionItem title="Provide Translations For your Language">
          <Dropdown
            id="default"
            titleText="Languages"
            helperText="Pick the language that you want to provide the translations for"
            label="Choose a language"
            items={getLanguages()}
            itemToString={(item) => (item ? item.language : '')}
            onChange={handleLanguageChange}
          />
          {selectedLanguage ? (
            <>
              <DataTable
                rows={tableRows}
                headers={headers}
                useStaticWidth={true}
                useZebraStyles={true}
                render={({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader key={header.key} {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => {
                          const rowData = tableRows.find((r) => r.id === row.id);
                          return (
                            <TableRow key={row.id} {...getRowProps({ row })}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>
                                  {cell.info.header === 'translation' ? (
                                    <TextInput
                                      id={`translation-${row.id}`}
                                      labelText=""
                                      placeholder="Enter translation"
                                    />
                                  ) : (
                                    cell.value
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              />
              <Button>Save Translation for {selectedLanguage.language}</Button>
            </>
          ) : null}
        </AccordionItem>
        <AccordionItem title="Auto Generate Translations For This Form">
          <Button>Generate translations for this form</Button>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
const TranslationBuilder: React.FC<TranslationBuilderProps> = (props) => {
  return (
    <>
      <TranslationProvider {...props}>
        <TranslationBuilderContent {...props} />
      </TranslationProvider>
    </>
  );
};

export default TranslationBuilder;
