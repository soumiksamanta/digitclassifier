import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist

# 🔍 Check GPU availability
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"✅ Using GPU: {gpus[0].name}")
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
else:
    print("⚠️ No GPU found. Using CPU.")

# 🔹 Load MNIST data
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# 🔹 Convert to tf.data.Dataset
train_ds = tf.data.Dataset.from_tensor_slices((x_train, y_train))
test_ds = tf.data.Dataset.from_tensor_slices((x_test, y_test))

# 🔧 Preprocessing function (resize to 128x128, normalize)
def preprocess(image, label):
    image = tf.expand_dims(image, -1)  # Shape: (28, 28, 1)
    image = tf.cast(image, tf.float32) / 255.0
    return image, label

# ⚙️ Batch + shuffle + prefetch
BATCH_SIZE = 64

train_ds = train_ds.map(preprocess).shuffle(10000).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
test_ds = test_ds.map(preprocess).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

# 🧠 CNN Model for 128x128 grayscale input
model = models.Sequential([
    layers.Input(shape=(28, 28, 1)),

    layers.Conv2D(32, 3, activation='relu'),
    layers.MaxPooling2D(),

    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(),

    layers.Conv2D(128, 3, activation='relu'),
    layers.MaxPooling2D(),

    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

# 🛠 Compile model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# 📊 Train model
model.fit(train_ds, epochs=5, validation_data=test_ds)

# ✅ Evaluate model
test_loss, test_acc = model.evaluate(test_ds)
print(f"\n🎯 Test accuracy: {test_acc:.4f}")
model.save('mnist_cnn_model.keras')
