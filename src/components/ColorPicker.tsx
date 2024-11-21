import React, { useState } from 'react';
import { View, StyleSheet, Text, Modal, Button } from 'react-native';
import { colors as themeColors } from '@/src/theme/colors';
import ColorPickerComponent, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider
} from 'reanimated-color-picker';
import { CustomButton } from './CustomButton';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const ColorPicker = ({ selectedColor, onSelectColor, isVisible, onClose }: ColorPickerProps) => {
  const [color, setColor] = useState<string>(selectedColor);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Color</Text>
          </View>

          <ColorPickerComponent
            style={styles.picker}
            value={selectedColor}
            onComplete={(colors) => setColor(colors.hex)}
          >
            <Preview hideText />
            <Panel1 />
            <HueSlider />
          </ColorPickerComponent>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Cancel"
              onPress={onClose}
              style={styles.button}
              variant="secondary"
            />
            <CustomButton
              title="Select"
              onPress={() => {
                onSelectColor(color);
                onClose();
              }}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: themeColors.background,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.onBackground,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
    gap: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
  }
});

export default ColorPicker;