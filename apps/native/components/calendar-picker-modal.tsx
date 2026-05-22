import { Modal, Pressable, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

const PRIMARY = "#2db07a";

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
  const markedDates = {
    [today]: {
      marked: selectedDate !== today,
      dotColor: PRIMARY,
      ...(selectedDate === today && {
        selected: true,
        selectedColor: PRIMARY,
      }),
    },
    ...(selectedDate !== today && {
      [selectedDate]: {
        selected: true,
        selectedColor: PRIMARY,
      },
    }),
  };

  const handleDayPress = (day: DateData) => {
    onSelect(day.dateString);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable>
          <View
            className="bg-card rounded-2xl overflow-hidden"
            style={{ width: 320 }}
          >
            <Calendar
              current={selectedDate}
              maxDate={today}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              firstDay={1}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                selectedDayBackgroundColor: PRIMARY,
                selectedDayTextColor: "#ffffff",
                todayTextColor: PRIMARY,
                arrowColor: PRIMARY,
                dotColor: PRIMARY,
                monthTextColor: "inherit",
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
