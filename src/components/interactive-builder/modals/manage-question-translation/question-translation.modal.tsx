import React, { useCallback, useEffect, useState } from 'react';
import { Translation, useTranslation } from 'react-i18next';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Form,
  ComboBox,
  Accordion,
  AccordionItem,
  Dropdown,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './translation-modal.scss';
import type { Schema, Question } from '@types';
import { TranslationProvider, useQuestionTranslation } from '../../../translation-builder/translation-context';

interface TranslationModalProps {
  question: Question;
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

const TranslationModalContent: React.FC<TranslationModalProps> = ({ question, closeModal, schema, onSchemaChange }) => {
  const { t } = useTranslation();
  const { translations, getLanguages, addOrUpdateTranslation, getTranslation } = useQuestionTranslation();

  const [translationText, setTranslationText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const { questionLabel, answerLabels } = extractQuestionAndAnswers(question);
  const [languageOptions, setLanguageOptions] = useState<{ language: string; code: string }[]>(getLanguages);

  function extractQuestionAndAnswers(question: Question) {
    let questionLabel = question.label || 'No label found';
    let answerLabels = question.questionOptions?.answers?.map((answer) => answer.label) || [];

    return { questionLabel, answerLabels };
  }
  const handleUpdatetranslation = useCallback(() => {
    if (selectedLanguage && translationText) {
      addOrUpdateTranslation(selectedLanguage, questionLabel, translationText);
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
      });
    } else {
      showSnackbar(
        t('pleaseSelectLanguageAndProvideTranslation', 'Please select a language and provide a translation'),
      );
    }
  }, [selectedLanguage, translationText, questionLabel, addOrUpdateTranslation, t]);

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('manageTranslation', 'Manage Translation')}
        closeModal={closeModal}
      />
      <Form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <ModalBody>
          <Dropdown
            id="default"
            titleText="Languages"
            helperText="Pick the language that you translate this label to"
            label="Choose a language"
            items={languageOptions}
            itemToString={(item: Record<string, string>) => (item ? item.language : '')}
            onChange={(e) => {
              setSelectedLanguage(e.selectedItem.code);
            }}
          />
          {questionLabel && selectedLanguage && (
            <>
              <TextInput
                id="questionLabel"
                labelText={questionLabel}
                placeholder={t('provideTranslationForThisQuestionLabel', 'Provide Translation For This Question Label')}
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
              />
              {answerLabels.length > 0
                ? answerLabels.map((answerLabel, index) => (
                    <TextInput
                      id={`answerLabel${index}`}
                      labelText={answerLabel}
                      placeholder={t(
                        'provideTranslationForThisAnswerLabel',
                        'Provide Translation For This Answer Label',
                      )}
                      value={translationText}
                      onChange={(e) => addOrUpdateTranslation(selectedLanguage, answerLabel, e.target.value)}
                    />
                  ))
                : null}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleUpdatetranslation}>{t('save', 'Save')}</Button>
        </ModalFooter>
      </Form>
    </>
  );
};

const TranslationModal: React.FC<TranslationModalProps> = (props) => {
  return (
    <>
      <TranslationProvider {...props}>
        <TranslationModalContent {...props} />
      </TranslationProvider>
    </>
  );
};

export default TranslationModal;
