import { DatePicker, Host } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";
import { Modal, Pressable, View } from "react-native";

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type CalendarPickerModalProps = {
  visible: boolean;
  selectedDate: string;
  today: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
};

export function CalendarPickerModal({
  visible,
  selectedDate,
  today,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/45 justify-center items-center"
        onPress={onClose}
      >
        {/* Absorb touches so backdrop tap does not bubble through the picker */}
        <Pressable>
          <View
            className="bg-card rounded-2xl overflow-hidden"
            style={{ width: 320, height: 360 }}
          >
            <Host style={{ flex: 1 }}>
              <DatePicker
                selection={isoToDate(selectedDate)}
                range={{ end: isoToDate(today) }}
                displayedComponents={["date"]}
                modifiers={[datePickerStyle("graphical")]}
                onDateChange={(date) => {
                  onSelect(dateToIso(date));
                  onClose();
                }}
              />
            </Host>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
