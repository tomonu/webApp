class CreateLylies < ActiveRecord::Migration
  def change
    create_table :lylies do |t|
      t.string    :lyric
      t.string    :title
      t.string    :artist
      t.integer   :sex
      t.string    :genre
      t.integer   :points
      t.timestamps
    end
  end
end
